"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[23274],{3905:(e,n,i)=>{i.d(n,{Zo:()=>s,kt:()=>m});var t=i(67294);function r(e,n,i){return n in e?Object.defineProperty(e,n,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[n]=i,e}function a(e,n){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),i.push.apply(i,t)}return i}function d(e){for(var n=1;n<arguments.length;n++){var i=null!=arguments[n]?arguments[n]:{};n%2?a(Object(i),!0).forEach((function(n){r(e,n,i[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):a(Object(i)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(i,n))}))}return e}function l(e,n){if(null==e)return{};var i,t,r=function(e,n){if(null==e)return{};var i,t,r={},a=Object.keys(e);for(t=0;t<a.length;t++)i=a[t],n.indexOf(i)>=0||(r[i]=e[i]);return r}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(t=0;t<a.length;t++)i=a[t],n.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(r[i]=e[i])}return r}var o=t.createContext({}),p=function(e){var n=t.useContext(o),i=n;return e&&(i="function"==typeof e?e(n):d(d({},n),e)),i},s=function(e){var n=p(e.components);return t.createElement(o.Provider,{value:n},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},k=t.forwardRef((function(e,n){var i=e.components,r=e.mdxType,a=e.originalType,o=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),c=p(i),k=r,m=c["".concat(o,".").concat(k)]||c[k]||u[k]||a;return i?t.createElement(m,d(d({ref:n},s),{},{components:i})):t.createElement(m,d({ref:n},s))}));function m(e,n){var i=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var a=i.length,d=new Array(a);d[0]=k;var l={};for(var o in n)hasOwnProperty.call(n,o)&&(l[o]=n[o]);l.originalType=e,l[c]="string"==typeof e?e:r,d[1]=l;for(var p=2;p<a;p++)d[p]=i[p];return t.createElement.apply(null,d)}return t.createElement.apply(null,i)}k.displayName="MDXCreateElement"},57925:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>o,contentTitle:()=>d,default:()=>u,frontMatter:()=>a,metadata:()=>l,toc:()=>p});var t=i(87462),r=(i(67294),i(3905));const a={id:"WindDataProvider",title:"Interface: WindDataProvider",sidebar_label:"WindDataProvider",sidebar_position:0,custom_edit_url:null},d=void 0,l={unversionedId:"garminsdk/interfaces/WindDataProvider",id:"garminsdk/interfaces/WindDataProvider",title:"Interface: WindDataProvider",description:"A provider of wind data.",source:"@site/docs/garminsdk/interfaces/WindDataProvider.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/WindDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/WindDataProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"WindDataProvider",title:"Interface: WindDataProvider",sidebar_label:"WindDataProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"WeatherRadarProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/WeatherRadarProps"},next:{title:"WindDisplayProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/WindDisplayProps"}},o={},p=[{value:"Implemented by",id:"implemented-by",level:2},{value:"Properties",id:"properties",level:2},{value:"crosswind",id:"crosswind",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"headwind",id:"headwind",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"isDataFailed",id:"isdatafailed",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"isGpsDeadReckoning",id:"isgpsdeadreckoning",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"magVar",id:"magvar",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"windDirection",id:"winddirection",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"windDirectionRelative",id:"winddirectionrelative",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"windSpeed",id:"windspeed",level:3},{value:"Defined in",id:"defined-in-7",level:4}],s={toc:p},c="wrapper";function u(e){let{components:n,...i}=e;return(0,r.kt)(c,(0,t.Z)({},s,i,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A provider of wind data."),(0,r.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultWindDataProvider"},(0,r.kt)("inlineCode",{parentName:"a"},"DefaultWindDataProvider")))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"crosswind"},"crosswind"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"crosswind"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The current crosswind component, in knots. Positive values indicate wind from the right, negative values indicate\nwind from the left."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"garminsdk/wind/WindDataProvider.ts:32"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"headwind"},"headwind"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"headwind"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The current headwind component, in knots. Positive values indicate headwind, negative values indicate tailwind."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"garminsdk/wind/WindDataProvider.ts:26"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isdatafailed"},"isDataFailed"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"isDataFailed"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,r.kt)("p",null,"Whether this provider's wind data is in a failed state."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"garminsdk/wind/WindDataProvider.ts:41"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isgpsdeadreckoning"},"isGpsDeadReckoning"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"isGpsDeadReckoning"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,r.kt)("p",null,"Whether GPS position is in dead reckoning mode."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"garminsdk/wind/WindDataProvider.ts:38"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"magvar"},"magVar"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"magVar"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The magnetic variation, in degrees, at the airplane's location."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"garminsdk/wind/WindDataProvider.ts:35"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"winddirection"},"windDirection"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"windDirection"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The current wind direction, in degrees true."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"garminsdk/wind/WindDataProvider.ts:14"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"winddirectionrelative"},"windDirectionRelative"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"windDirectionRelative"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The current wind direction relative to airplane heading, in degrees. A value of zero degrees indicates a direct\nheadwind, with positive angles proceeding clockwise."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"garminsdk/wind/WindDataProvider.ts:20"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"windspeed"},"windSpeed"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"windSpeed"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The current wind speed, in knots."),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"garminsdk/wind/WindDataProvider.ts:23"))}u.isMDXComponent=!0}}]);