"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[8505],{3905:(e,n,t)=>{t.d(n,{Zo:()=>s,kt:()=>m});var r=t(67294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function a(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var d=r.createContext({}),p=function(e){var n=r.useContext(d),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},s=function(e){var n=p(e.components);return r.createElement(d.Provider,{value:n},e.children)},h="mdxType",u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},k=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,o=e.originalType,d=e.parentName,s=a(e,["components","mdxType","originalType","parentName"]),h=p(t),k=i,m=h["".concat(d,".").concat(k)]||h[k]||u[k]||o;return t?r.createElement(m,l(l({ref:n},s),{},{components:t})):r.createElement(m,l({ref:n},s))}));function m(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var o=t.length,l=new Array(o);l[0]=k;var a={};for(var d in n)hasOwnProperty.call(n,d)&&(a[d]=n[d]);a.originalType=e,a[h]="string"==typeof e?e:i,l[1]=a;for(var p=2;p<o;p++)l[p]=t[p];return r.createElement.apply(null,l)}return r.createElement.apply(null,t)}k.displayName="MDXCreateElement"},78444:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>l,default:()=>u,frontMatter:()=>o,metadata:()=>a,toc:()=>p});var r=t(87462),i=(t(67294),t(3905));const o={id:"FlightPathMarkerProps",title:"Interface: FlightPathMarkerProps",sidebar_label:"FlightPathMarkerProps",sidebar_position:0,custom_edit_url:null},l=void 0,a={unversionedId:"garminsdk/interfaces/FlightPathMarkerProps",id:"garminsdk/interfaces/FlightPathMarkerProps",title:"Interface: FlightPathMarkerProps",description:"Component props for FlightPathMarker.",source:"@site/docs/garminsdk/interfaces/FlightPathMarkerProps.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/FlightPathMarkerProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/FlightPathMarkerProps",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FlightPathMarkerProps",title:"Interface: FlightPathMarkerProps",sidebar_label:"FlightPathMarkerProps",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightDirectorSingleCueProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/FlightDirectorSingleCueProps"},next:{title:"FlightPlanLegWaypointsRecord",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/FlightPlanLegWaypointsRecord"}},d={},p=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"children",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"lookahead",id:"lookahead",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"minGroundSpeed",id:"mingroundspeed",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"projection",id:"projection",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"ref",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"show",id:"show",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"smoothingTimeConstant",id:"smoothingtimeconstant",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"updateFreq",id:"updatefreq",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-8",level:4}],s={toc:p},h="wrapper";function u(e){let{components:n,...t}=e;return(0,i.kt)(h,(0,r.Z)({},s,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Component props for FlightPathMarker."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("inlineCode",{parentName:"p"},"HorizonLayerProps")),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"FlightPathMarkerProps"))))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"bus"},"bus"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"bus"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,i.kt)("p",null,"The event bus."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/components/nextgenpfd/horizon/FlightPathMarker.tsx:11"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"children"},"children"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"children"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"DisplayChildren"),"[]"),(0,i.kt)("p",null,"The children of the display component."),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,"HorizonLayerProps.children"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/FSComponent.ts:122"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lookahead"},"lookahead"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"lookahead"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The lookahead time of the flight path marker, in seconds. Defaults to 60 seconds."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/components/nextgenpfd/horizon/FlightPathMarker.tsx:20"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"mingroundspeed"},"minGroundSpeed"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"minGroundSpeed"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The minimum ground speed, in knots, required for the flight path marker to be displayed. Defaults to 30 knots."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/components/nextgenpfd/horizon/FlightPathMarker.tsx:17"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"projection"},"projection"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"projection"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"HorizonProjection")),(0,i.kt)("p",null,"The layer's horizon projection."),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,"HorizonLayerProps.projection"),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/horizon/HorizonLayer.ts:10"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ref"},"ref"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"ref"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,i.kt)("p",null,"A reference to the display component."),(0,i.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,i.kt)("p",null,"HorizonLayerProps.ref"),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/FSComponent.ts:125"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"show"},"show"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"show"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Whether to show the flight path marker."),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/components/nextgenpfd/horizon/FlightPathMarker.tsx:14"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"smoothingtimeconstant"},"smoothingTimeConstant"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"smoothingTimeConstant"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The smoothing time constant for ground track and ground speed, in milliseconds. Defaults to ",(0,i.kt)("inlineCode",{parentName:"p"},"500 / ln(2)"),"."),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/components/nextgenpfd/horizon/FlightPathMarker.tsx:23"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"updatefreq"},"updateFreq"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"updateFreq"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"A subscribable which provides the maximum update frequency of the layer, in hertz. Note that the actual update\nfrequency will not exceed the update frequency of the layer's parent map. If not defined, the frequency will\ndefault to that of the layer's parent map."),(0,i.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,i.kt)("p",null,"HorizonLayerProps.updateFreq"),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/horizon/HorizonLayer.ts:17"))}u.isMDXComponent=!0}}]);