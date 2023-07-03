"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[3463],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>c});var i=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},l=Object.keys(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=i.createContext({}),o=function(e){var t=i.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},s=function(e){var t=o(e.components);return i.createElement(p.Provider,{value:t},e.children)},k="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},m=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,l=e.originalType,p=e.parentName,s=d(e,["components","mdxType","originalType","parentName"]),k=o(n),m=a,c=k["".concat(p,".").concat(m)]||k[m]||u[m]||l;return n?i.createElement(c,r(r({ref:t},s),{},{components:n})):i.createElement(c,r({ref:t},s))}));function c(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=n.length,r=new Array(l);r[0]=m;var d={};for(var p in t)hasOwnProperty.call(t,p)&&(d[p]=t[p]);d.originalType=e,d[k]="string"==typeof e?e:a,r[1]=d;for(var o=2;o<l;o++)r[o]=n[o];return i.createElement.apply(null,r)}return i.createElement.apply(null,n)}m.displayName="MDXCreateElement"},3892:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>r,default:()=>u,frontMatter:()=>l,metadata:()=>d,toc:()=>o});var i=n(87462),a=(n(67294),n(3905));const l={id:"index.BacklightLevelController",title:"Class: BacklightLevelController",sidebar_label:"BacklightLevelController",custom_edit_url:null},r=void 0,d={unversionedId:"framework/classes/index.BacklightLevelController",id:"framework/classes/index.BacklightLevelController",title:"Class: BacklightLevelController",description:"index.BacklightLevelController",source:"@site/docs/framework/classes/index.BacklightLevelController.md",sourceDirName:"framework/classes",slug:"/framework/classes/index.BacklightLevelController",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.BacklightLevelController",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.BacklightLevelController",title:"Class: BacklightLevelController",sidebar_label:"BacklightLevelController",custom_edit_url:null},sidebar:"sidebar",previous:{title:"AvionicsPlugin",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.AvionicsPlugin"},next:{title:"BaseInstrumentPublisher",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.BaseInstrumentPublisher"}},p={},o=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"_autoMaxIntensity",id:"_automaxintensity",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"_autoMinIntensity",id:"_autominintensity",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"_intensity",id:"_intensity",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"altitude",id:"altitude",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"intensity",id:"intensity",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"lastSimTime",id:"lastsimtime",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"needRecalcAuto",id:"needrecalcauto",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"paused",id:"paused",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"ppos",id:"ppos",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"pposSub",id:"ppossub",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"simTime",id:"simtime",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"updateSub",id:"updatesub",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"AUTO_MAX_SOLAR_HORIZON_ANGLE",id:"auto_max_solar_horizon_angle",level:3},{value:"Defined in",id:"defined-in-13",level:4},{value:"AUTO_MAX_SOLAR_HORIZON_ANGLE_RAD",id:"auto_max_solar_horizon_angle_rad",level:3},{value:"Defined in",id:"defined-in-14",level:4},{value:"AUTO_MIN_SOLAR_HORIZON_ANGLE",id:"auto_min_solar_horizon_angle",level:3},{value:"Defined in",id:"defined-in-15",level:4},{value:"AUTO_MIN_SOLAR_HORIZON_ANGLE_RAD",id:"auto_min_solar_horizon_angle_rad",level:3},{value:"Defined in",id:"defined-in-16",level:4},{value:"AUTO_UPDATE_REALTIME_FREQ",id:"auto_update_realtime_freq",level:3},{value:"Defined in",id:"defined-in-17",level:4},{value:"AUTO_UPDATE_SIMTIME_THRESHOLD",id:"auto_update_simtime_threshold",level:3},{value:"Defined in",id:"defined-in-18",level:4},{value:"DAY",id:"day",level:3},{value:"Defined in",id:"defined-in-19",level:4},{value:"DEFAULT_MAX_INTENSITY",id:"default_max_intensity",level:3},{value:"Defined in",id:"defined-in-20",level:4},{value:"DEFAULT_MIN_INTENSITY",id:"default_min_intensity",level:3},{value:"Defined in",id:"defined-in-21",level:4},{value:"EPOCH",id:"epoch",level:3},{value:"Defined in",id:"defined-in-22",level:4},{value:"tempVec3",id:"tempvec3",level:3},{value:"Defined in",id:"defined-in-23",level:4},{value:"Accessors",id:"accessors",level:2},{value:"autoMaxIntensity",id:"automaxintensity",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-24",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-25",level:4},{value:"autoMinIntensity",id:"autominintensity",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-26",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-27",level:4},{value:"Methods",id:"methods",level:2},{value:"onPPosChanged",id:"onpposchanged",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-28",level:4},{value:"onUpdate",id:"onupdate",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-29",level:4},{value:"setPaused",id:"setpaused",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-30",level:4},{value:"updateAutoBacklightIntensity",id:"updateautobacklightintensity",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Defined in",id:"defined-in-31",level:4},{value:"calculateSubSolarPoint",id:"calculatesubsolarpoint",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Defined in",id:"defined-in-32",level:4}],s={toc:o},k="wrapper";function u(e){let{components:t,...n}=e;return(0,a.kt)(k,(0,i.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".BacklightLevelController"),(0,a.kt)("p",null,"A controller for automated backlighting levels based upon the angle of the sun in the sky."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new BacklightLevelController"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"paused?"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"minIntensity?"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"maxIntensity?"),")"),(0,a.kt)("p",null,"Creates an automatic backlight controller."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"bus")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.EventBus"},(0,a.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"undefined")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"paused")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"false")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Whether the controller should be initially paused. Defaults to ",(0,a.kt)("inlineCode",{parentName:"td"},"false"),".")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"minIntensity")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"BacklightLevelController.DEFAULT_MIN_INTENSITY")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The maximum intensity commanded by the controller. Defaults to 0.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"maxIntensity")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"BacklightLevelController.DEFAULT_MAX_INTENSITY")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The minimum intensity commanded by the controller. Defaults to 1.")))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:60"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"_automaxintensity"},"_","autoMaxIntensity"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"_","autoMaxIntensity"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:42"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"_autominintensity"},"_","autoMinIntensity"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"_","autoMinIntensity"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:43"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"_intensity"},"_","intensity"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"_","intensity"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.Subject"},(0,a.kt)("inlineCode",{parentName:"a"},"Subject")),"<",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:49"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"altitude"},"altitude"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"altitude"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"0")),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:37"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"intensity"},"intensity"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"intensity"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.Subscribable"},(0,a.kt)("inlineCode",{parentName:"a"},"Subscribable")),"<",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The automatic backlight intensity computed by this controller."),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:51"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"lastsimtime"},"lastSimTime"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"lastSimTime"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"0")),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:40"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"needrecalcauto"},"needRecalcAuto"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"needRecalcAuto"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"true")),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:39"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"paused"},"paused"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"paused"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"false")),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:44"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"ppos"},"ppos"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"ppos"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Float64Array")),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:36"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"ppossub"},"pposSub"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"pposSub"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.Subscription"},(0,a.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:46"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"simtime"},"simTime"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"simTime"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.ConsumerValue"},(0,a.kt)("inlineCode",{parentName:"a"},"ConsumerValue")),"<",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:35"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"updatesub"},"updateSub"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"updateSub"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.Subscription"},(0,a.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,a.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:47"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"auto_max_solar_horizon_angle"},"AUTO","_","MAX","_","SOLAR","_","HORIZON","_","ANGLE"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"AUTO","_","MAX","_","SOLAR","_","HORIZON","_","ANGLE"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"4")),(0,a.kt)("p",null,"The difference, in degrees, between horizon zenith angle and solar zenith angle at which auto backlight reaches maximum intensity."),(0,a.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:19"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"auto_max_solar_horizon_angle_rad"},"AUTO","_","MAX","_","SOLAR","_","HORIZON","_","ANGLE","_","RAD"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"AUTO","_","MAX","_","SOLAR","_","HORIZON","_","ANGLE","_","RAD"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:22"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"auto_min_solar_horizon_angle"},"AUTO","_","MIN","_","SOLAR","_","HORIZON","_","ANGLE"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"AUTO","_","MIN","_","SOLAR","_","HORIZON","_","ANGLE"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"-6")),(0,a.kt)("p",null,"The difference, in degrees, between horizon zenith angle and solar zenith angle at which auto backlight reaches minimum intensity."),(0,a.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:21"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"auto_min_solar_horizon_angle_rad"},"AUTO","_","MIN","_","SOLAR","_","HORIZON","_","ANGLE","_","RAD"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"AUTO","_","MIN","_","SOLAR","_","HORIZON","_","ANGLE","_","RAD"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:23"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"auto_update_realtime_freq"},"AUTO","_","UPDATE","_","REALTIME","_","FREQ"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"AUTO","_","UPDATE","_","REALTIME","_","FREQ"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"10")),(0,a.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:25"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"auto_update_simtime_threshold"},"AUTO","_","UPDATE","_","SIMTIME","_","THRESHOLD"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"AUTO","_","UPDATE","_","SIMTIME","_","THRESHOLD"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"60000")),(0,a.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:26"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"day"},"DAY"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"DAY"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"86400000")),(0,a.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:28"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"default_max_intensity"},"DEFAULT","_","MAX","_","INTENSITY"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"DEFAULT","_","MAX","_","INTENSITY"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"1")),(0,a.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:31"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"default_min_intensity"},"DEFAULT","_","MIN","_","INTENSITY"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"DEFAULT","_","MIN","_","INTENSITY"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"0")),(0,a.kt)("h4",{id:"defined-in-21"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:30"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"epoch"},"EPOCH"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"EPOCH"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"946684800000")),(0,a.kt)("h4",{id:"defined-in-22"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:27"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"tempvec3"},"tempVec3"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"tempVec3"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Float64Array")),(0,a.kt)("h4",{id:"defined-in-23"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:33"),(0,a.kt)("h2",{id:"accessors"},"Accessors"),(0,a.kt)("h3",{id:"automaxintensity"},"autoMaxIntensity"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"get")," ",(0,a.kt)("strong",{parentName:"p"},"autoMaxIntensity"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Get the max auto intensity value"),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The maximum intensity applied by the auto backlight."),(0,a.kt)("h4",{id:"defined-in-24"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:82"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"set")," ",(0,a.kt)("strong",{parentName:"p"},"autoMaxIntensity"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"max_intensity"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Set the max auto intensity value."),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"max_intensity")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The maximum intensity applied by auto backlight.")))),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-25"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:90"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"autominintensity"},"autoMinIntensity"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"get")," ",(0,a.kt)("strong",{parentName:"p"},"autoMinIntensity"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Get the min auto intensity value"),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"THe minimum intensity applied by the auto backlight."),(0,a.kt)("h4",{id:"defined-in-26"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:99"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"set")," ",(0,a.kt)("strong",{parentName:"p"},"autoMinIntensity"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"min_intensity"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Set the min auto intensity value."),(0,a.kt)("h4",{id:"parameters-2"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"min_intensity")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The minimum intensity applied by the auto backlight.")))),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-27"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:107"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"onpposchanged"},"onPPosChanged"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"onPPosChanged"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"ppos"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"A callback which is called when the user's location changes."),(0,a.kt)("h4",{id:"parameters-3"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"ppos")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"LatLongAlt")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The new plane position.")))),(0,a.kt)("h4",{id:"returns-4"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-28"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:137"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onupdate"},"onUpdate"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"onUpdate"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Updates this controller's commanded backlight intensity if necessary."),(0,a.kt)("h4",{id:"returns-5"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-29"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:153"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"setpaused"},"setPaused"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"setPaused"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"paused"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Pause or unpause real-time processing."),(0,a.kt)("h4",{id:"parameters-4"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"paused")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Whether to pause or not.")))),(0,a.kt)("h4",{id:"returns-6"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-30"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:116"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"updateautobacklightintensity"},"updateAutoBacklightIntensity"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"updateAutoBacklightIntensity"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"simTime"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Updates this controller's commanded backlight intensity according to the auto setting algorithm."),(0,a.kt)("h4",{id:"parameters-5"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"simTime")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The current sim time.")))),(0,a.kt)("h4",{id:"returns-7"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-31"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:168"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"calculatesubsolarpoint"},"calculateSubSolarPoint"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"calculateSubSolarPoint"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"time"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"out"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"Float64Array")),(0,a.kt)("p",null,"Calculates the subsolar point (the point on Earth's surface directly below the Sun, where solar zenith angle = 0)\ngiven a specific time."),(0,a.kt)("h4",{id:"parameters-6"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"time")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"A UNIX timestamp in milliseconds.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"out")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Float64Array")),(0,a.kt)("td",{parentName:"tr",align:"left"},"A Float64Array object to which to write the result.")))),(0,a.kt)("h4",{id:"returns-8"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"Float64Array")),(0,a.kt)("p",null,"The subsolar point at the specified time."),(0,a.kt)("h4",{id:"defined-in-32"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/controllers/Backlight.ts:196"))}u.isMDXComponent=!0}}]);