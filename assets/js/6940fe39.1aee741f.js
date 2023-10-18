"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[49883],{3905:(e,n,t)=>{t.d(n,{Zo:()=>s,kt:()=>m});var i=t(67294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function d(e,n){if(null==e)return{};var t,i,a=function(e,n){if(null==e)return{};var t,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)t=r[i],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)t=r[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var o=i.createContext({}),p=function(e){var n=i.useContext(o),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},s=function(e){var n=p(e.components);return i.createElement(o.Provider,{value:n},e.children)},v="mdxType",u={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},k=i.forwardRef((function(e,n){var t=e.components,a=e.mdxType,r=e.originalType,o=e.parentName,s=d(e,["components","mdxType","originalType","parentName"]),v=p(t),k=a,m=v["".concat(o,".").concat(k)]||v[k]||u[k]||r;return t?i.createElement(m,l(l({ref:n},s),{},{components:t})):i.createElement(m,l({ref:n},s))}));function m(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var r=t.length,l=new Array(r);l[0]=k;var d={};for(var o in n)hasOwnProperty.call(n,o)&&(d[o]=n[o]);d.originalType=e,d[v]="string"==typeof e?e:a,l[1]=d;for(var p=2;p<r;p++)l[p]=t[p];return i.createElement.apply(null,l)}return i.createElement.apply(null,t)}k.displayName="MDXCreateElement"},39683:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>o,contentTitle:()=>l,default:()=>u,frontMatter:()=>r,metadata:()=>d,toc:()=>p});var i=t(87462),a=(t(67294),t(3905));const r={id:"VNavDataProvider",title:"Interface: VNavDataProvider",sidebar_label:"VNavDataProvider",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"garminsdk/interfaces/VNavDataProvider",id:"garminsdk/interfaces/VNavDataProvider",title:"Interface: VNavDataProvider",description:"A provider of VNAV data for various displays.",source:"@site/docs/garminsdk/interfaces/VNavDataProvider.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/VNavDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/VNavDataProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"VNavDataProvider",title:"Interface: VNavDataProvider",sidebar_label:"VNavDataProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"VNavDataEvents",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/VNavDataEvents"},next:{title:"VSpeedAnnunciationDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/VSpeedAnnunciationDataProvider"}},o={},p=[{value:"Implemented by",id:"implemented-by",level:2},{value:"Properties",id:"properties",level:2},{value:"activeConstraintLeg",id:"activeconstraintleg",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"cruiseAltitude",id:"cruisealtitude",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"distanceToTod",id:"distancetotod",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"fpa",id:"fpa",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"isVNavDirectToActive",id:"isvnavdirecttoactive",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"pathMode",id:"pathmode",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"phase",id:"phase",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"targetRestriction",id:"targetrestriction",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"timeToBoc",id:"timetoboc",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"timeToBod",id:"timetobod",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"timeToToc",id:"timetotoc",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"timeToTod",id:"timetotod",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"verticalDeviation",id:"verticaldeviation",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"verticalSpeedTarget",id:"verticalspeedtarget",level:3},{value:"Defined in",id:"defined-in-13",level:4},{value:"vnavFlightPhase",id:"vnavflightphase",level:3},{value:"Defined in",id:"defined-in-14",level:4},{value:"vnavTrackingPhase",id:"vnavtrackingphase",level:3},{value:"Defined in",id:"defined-in-15",level:4},{value:"vsRequired",id:"vsrequired",level:3},{value:"Defined in",id:"defined-in-16",level:4}],s={toc:p},v="wrapper";function u(e){let{components:n,...t}=e;return(0,a.kt)(v,(0,i.Z)({},s,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A provider of VNAV data for various displays."),(0,a.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultVNavDataProvider"},(0,a.kt)("inlineCode",{parentName:"a"},"DefaultVNavDataProvider")))),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"activeconstraintleg"},"activeConstraintLeg"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"activeConstraintLeg"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"LegDefinition"),">"),(0,a.kt)("p",null,"The flight plan leg that defines the active VNAV constraint."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"garminsdk/navigation/VNavDataProvider.ts:49"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"cruisealtitude"},"cruiseAltitude"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"cruiseAltitude"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The current VNAV cruise altitude, in feet."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"garminsdk/navigation/VNavDataProvider.ts:46"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"distancetotod"},"distanceToTod"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"distanceToTod"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The distance remaining to the next top of descent, in nautical miles."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"garminsdk/navigation/VNavDataProvider.ts:67"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"fpa"},"fpa"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"fpa"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The desired flight path angle, in degrees, for the current VNAV leg. Positive angles represent descending paths."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"garminsdk/navigation/VNavDataProvider.ts:55"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"isvnavdirecttoactive"},"isVNavDirectToActive"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"isVNavDirectToActive"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether VNAV direct-to is currently active."),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"garminsdk/navigation/VNavDataProvider.ts:40"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"pathmode"},"pathMode"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"pathMode"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"VNavPathMode"),">"),(0,a.kt)("p",null,"The current VNAV path mode."),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"garminsdk/navigation/VNavDataProvider.ts:43"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"phase"},"phase"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"phase"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"VerticalFlightPhase"),">"),(0,a.kt)("p",null,"The current VNAV phase."),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"garminsdk/navigation/VNavDataProvider.ts:31"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"targetrestriction"},"targetRestriction"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"targetRestriction"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#vnavtargetaltituderestriction"},(0,a.kt)("inlineCode",{parentName:"a"},"VNavTargetAltitudeRestriction")),">"),(0,a.kt)("p",null,"The target VNAV altitude restriction."),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"garminsdk/navigation/VNavDataProvider.ts:52"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"timetoboc"},"timeToBoc"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"timeToBoc"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The time remaining to the next bottom of climb, in seconds."),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"garminsdk/navigation/VNavDataProvider.ts:79"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"timetobod"},"timeToBod"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"timeToBod"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The time remaining to the next bottom of descent, in seconds."),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"garminsdk/navigation/VNavDataProvider.ts:73"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"timetotoc"},"timeToToc"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"timeToToc"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The time remaining to the next top of climb, in seconds."),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"garminsdk/navigation/VNavDataProvider.ts:76"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"timetotod"},"timeToTod"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"timeToTod"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The time remaining to the next top of descent, in seconds."),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"garminsdk/navigation/VNavDataProvider.ts:70"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"verticaldeviation"},"verticalDeviation"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"verticalDeviation"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The vertical deviation, in feet, from the VNAV path profile. Positive values indicate deviation above the profile."),(0,a.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,a.kt)("p",null,"garminsdk/navigation/VNavDataProvider.ts:64"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"verticalspeedtarget"},"verticalSpeedTarget"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"verticalSpeedTarget"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The vertical speed target, in feet per minute, for the current VNAV leg."),(0,a.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,a.kt)("p",null,"garminsdk/navigation/VNavDataProvider.ts:58"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"vnavflightphase"},"vnavFlightPhase"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"vnavFlightPhase"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/GarminVNavFlightPhase"},(0,a.kt)("inlineCode",{parentName:"a"},"GarminVNavFlightPhase")),">"),(0,a.kt)("p",null,"The current VNAV flight phase."),(0,a.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,a.kt)("p",null,"garminsdk/navigation/VNavDataProvider.ts:34"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"vnavtrackingphase"},"vnavTrackingPhase"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"vnavTrackingPhase"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/GarminVNavTrackingPhase"},(0,a.kt)("inlineCode",{parentName:"a"},"GarminVNavTrackingPhase")),">"),(0,a.kt)("p",null,"The current VNAV tracking phase."),(0,a.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,a.kt)("p",null,"garminsdk/navigation/VNavDataProvider.ts:37"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"vsrequired"},"vsRequired"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"vsRequired"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The vertical speed required, in feet per minute, to meet the active VNAV restriction."),(0,a.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,a.kt)("p",null,"garminsdk/navigation/VNavDataProvider.ts:61"))}u.isMDXComponent=!0}}]);