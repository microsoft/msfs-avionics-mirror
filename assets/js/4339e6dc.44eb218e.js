"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[35784],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>f});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},l=Object.keys(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var o=i.createContext({}),u=function(e){var t=i.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},p=function(e){var t=u(e.components);return i.createElement(o.Provider,{value:t},e.children)},s="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},c=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,l=e.originalType,o=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),s=u(n),c=r,f=s["".concat(o,".").concat(c)]||s[c]||m[c]||l;return n?i.createElement(f,a(a({ref:t},p),{},{components:n})):i.createElement(f,a({ref:t},p))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var l=n.length,a=new Array(l);a[0]=c;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[s]="string"==typeof e?e:r,a[1]=d;for(var u=2;u<l;u++)a[u]=n[u];return i.createElement.apply(null,a)}return i.createElement.apply(null,n)}c.displayName="MDXCreateElement"},59493:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>a,default:()=>m,frontMatter:()=>l,metadata:()=>d,toc:()=>u});var i=n(87462),r=(n(67294),n(3905));const l={id:"AltitudeAlertState",title:"Enumeration: AltitudeAlertState",sidebar_label:"AltitudeAlertState",sidebar_position:0,custom_edit_url:null},a=void 0,d={unversionedId:"garminsdk/enums/AltitudeAlertState",id:"garminsdk/enums/AltitudeAlertState",title:"Enumeration: AltitudeAlertState",description:"Altitude alert states.",source:"@site/docs/garminsdk/enums/AltitudeAlertState.md",sourceDirName:"garminsdk/enums",slug:"/garminsdk/enums/AltitudeAlertState",permalink:"/msfs-avionics-mirror/docs/garminsdk/enums/AltitudeAlertState",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AltitudeAlertState",title:"Enumeration: AltitudeAlertState",sidebar_label:"AltitudeAlertState",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AirwayLegType",permalink:"/msfs-avionics-mirror/docs/garminsdk/enums/AirwayLegType"},next:{title:"AttitudeAircraftSymbolFormat",permalink:"/msfs-avionics-mirror/docs/garminsdk/enums/AttitudeAircraftSymbolFormat"}},o={},u=[{value:"Enumeration Members",id:"enumeration-members",level:2},{value:"Armed",id:"armed",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"Captured",id:"captured",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Deviation",id:"deviation",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"Disabled",id:"disabled",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"Inhibited",id:"inhibited",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"Within1000",id:"within1000",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"Within200",id:"within200",level:3},{value:"Defined in",id:"defined-in-6",level:4}],p={toc:u},s="wrapper";function m(e){let{components:t,...n}=e;return(0,r.kt)(s,(0,i.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Altitude alert states."),(0,r.kt)("h2",{id:"enumeration-members"},"Enumeration Members"),(0,r.kt)("h3",{id:"armed"},"Armed"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"Armed")," = ",(0,r.kt)("inlineCode",{parentName:"p"},'"Armed"')),(0,r.kt)("p",null,"Armed and outside of 1000 feet of selected altitude prior to capture."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/altimeter/AltitudeAlerter.ts:25"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"captured"},"Captured"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"Captured")," = ",(0,r.kt)("inlineCode",{parentName:"p"},'"Captured"')),(0,r.kt)("p",null,"Captured the selected altitude."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/altimeter/AltitudeAlerter.ts:31"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"deviation"},"Deviation"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"Deviation")," = ",(0,r.kt)("inlineCode",{parentName:"p"},'"Deviation"')),(0,r.kt)("p",null,"Deviation from captured altitude is greater than 200 feet."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/altimeter/AltitudeAlerter.ts:33"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"disabled"},"Disabled"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"Disabled")," = ",(0,r.kt)("inlineCode",{parentName:"p"},'"Disabled"')),(0,r.kt)("p",null,"Disabled."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/altimeter/AltitudeAlerter.ts:21"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"inhibited"},"Inhibited"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"Inhibited")," = ",(0,r.kt)("inlineCode",{parentName:"p"},'"Inhibited"')),(0,r.kt)("p",null,"Inhibited."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/altimeter/AltitudeAlerter.ts:23"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"within1000"},"Within1000"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"Within1000")," = ",(0,r.kt)("inlineCode",{parentName:"p"},'"Within1000"')),(0,r.kt)("p",null,"Within 1000 feet of selected altitude prior to capture."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/altimeter/AltitudeAlerter.ts:27"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"within200"},"Within200"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"Within200")," = ",(0,r.kt)("inlineCode",{parentName:"p"},'"Within200"')),(0,r.kt)("p",null,"Within 200 feet of selected altitude prior to capture."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/altimeter/AltitudeAlerter.ts:29"))}m.isMDXComponent=!0}}]);