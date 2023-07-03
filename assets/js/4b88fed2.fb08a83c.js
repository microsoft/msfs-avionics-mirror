"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[41882],{3905:(e,n,t)=>{t.d(n,{Zo:()=>p,kt:()=>m});var i=t(67294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function l(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?l(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function d(e,n){if(null==e)return{};var t,i,r=function(e,n){if(null==e)return{};var t,i,r={},l=Object.keys(e);for(i=0;i<l.length;i++)t=l[i],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(i=0;i<l.length;i++)t=l[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var s=i.createContext({}),o=function(e){var n=i.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},p=function(e){var n=o(e.components);return i.createElement(s.Provider,{value:n},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},k=i.forwardRef((function(e,n){var t=e.components,r=e.mdxType,l=e.originalType,s=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),u=o(t),k=r,m=u["".concat(s,".").concat(k)]||u[k]||c[k]||l;return t?i.createElement(m,a(a({ref:n},p),{},{components:t})):i.createElement(m,a({ref:n},p))}));function m(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var l=t.length,a=new Array(l);a[0]=k;var d={};for(var s in n)hasOwnProperty.call(n,s)&&(d[s]=n[s]);d.originalType=e,d[u]="string"==typeof e?e:r,a[1]=d;for(var o=2;o<l;o++)a[o]=t[o];return i.createElement.apply(null,a)}return i.createElement.apply(null,t)}k.displayName="MDXCreateElement"},764:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>a,default:()=>c,frontMatter:()=>l,metadata:()=>d,toc:()=>o});var i=t(87462),r=(t(67294),t(3905));const l={id:"index.GNSSEvents",title:"Interface: GNSSEvents",sidebar_label:"GNSSEvents",custom_edit_url:null},a=void 0,d={unversionedId:"framework/interfaces/index.GNSSEvents",id:"framework/interfaces/index.GNSSEvents",title:"Interface: GNSSEvents",description:"index.GNSSEvents",source:"@site/docs/framework/interfaces/index.GNSSEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/index.GNSSEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.GNSSEvents",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.GNSSEvents",title:"Interface: GNSSEvents",sidebar_label:"GNSSEvents",custom_edit_url:null},sidebar:"sidebar",previous:{title:"FuelSystemEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.FuelSystemEvents"},next:{title:"GPSEphemeris",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.GPSEphemeris"}},s={},o=[{value:"Properties",id:"properties",level:2},{value:"gps-position",id:"gps-position",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"ground_speed",id:"ground_speed",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"inertial_acceleration",id:"inertial_acceleration",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"inertial_speed",id:"inertial_speed",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"inertial_track_acceleration",id:"inertial_track_acceleration",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"inertial_vertical_speed",id:"inertial_vertical_speed",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"magvar",id:"magvar",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"time_of_day",id:"time_of_day",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"track_deg_magnetic",id:"track_deg_magnetic",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"track_deg_true",id:"track_deg_true",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"zulu_time",id:"zulu_time",level:3},{value:"Defined in",id:"defined-in-10",level:4}],p={toc:o},u="wrapper";function c(e){let{components:n,...t}=e;return(0,r.kt)(u,(0,i.Z)({},p,t,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".GNSSEvents"),(0,r.kt)("p",null,"Events related to global positioning and inertial data."),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"gps-position"},"gps-position"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"gps-position"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"LatLongAlt")),(0,r.kt)("p",null,"A GNSS location change event."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/GNSS.ts:16"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ground_speed"},"ground","_","speed"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"ground","_","speed"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The airplane's ground speed, in knots."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/GNSS.ts:31"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"inertial_acceleration"},"inertial","_","acceleration"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"inertial","_","acceleration"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The airplane's inertial acceleration, in meters per second per second."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/GNSS.ts:49"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"inertial_speed"},"inertial","_","speed"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"inertial","_","speed"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The airplane's inertial speed, in meters per second."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/GNSS.ts:40"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"inertial_track_acceleration"},"inertial","_","track","_","acceleration"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"inertial","_","track","_","acceleration"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The component of the airplane's inertial acceleration parallel to the airplane's inertial velocity, in meters per\nsecond per second."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/GNSS.ts:55"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"inertial_vertical_speed"},"inertial","_","vertical","_","speed"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"inertial","_","vertical","_","speed"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The airplane's inertial vertical speed, in feet per minute. This is the component of the airplane's inertial\nvelocity parallel to the vector directed from the earth's center to the airplane."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/GNSS.ts:46"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"magvar"},"magvar"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"magvar"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The current magnetic variation (declination) at the airplane's position, in degrees. Positive values represent\neastward declination (i.e. magnetic north points east of true north)."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/GNSS.ts:37"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"time_of_day"},"time","_","of","_","day"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"time","_","of","_","day"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The current time of day change event."),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/GNSS.ts:22"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"track_deg_magnetic"},"track","_","deg","_","magnetic"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"track","_","deg","_","magnetic"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The airplane's ground track, in degrees magnetic north."),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/GNSS.ts:28"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"track_deg_true"},"track","_","deg","_","true"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"track","_","deg","_","true"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The airplane's ground track, in degrees true north."),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/GNSS.ts:25"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"zulu_time"},"zulu","_","time"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"zulu","_","time"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The current zulu time change event."),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/GNSS.ts:19"))}c.isMDXComponent=!0}}]);