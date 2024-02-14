"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[35242],{3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>k});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},o=Object.keys(e);for(r=0;r<o.length;r++)a=o[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)a=o[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var s=r.createContext({}),m=function(e){var t=r.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},p=function(e){var t=m(e.components);return r.createElement(s.Provider,{value:t},e.children)},d="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,o=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),d=m(a),u=n,k=d["".concat(s,".").concat(u)]||d[u]||c[u]||o;return a?r.createElement(k,i(i({ref:t},p),{},{components:a})):r.createElement(k,i({ref:t},p))}));function k(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=a.length,i=new Array(o);i[0]=u;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[d]="string"==typeof e?e:n,i[1]=l;for(var m=2;m<o;m++)i[m]=a[m];return r.createElement.apply(null,i)}return r.createElement.apply(null,a)}u.displayName="MDXCreateElement"},71409:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>c,frontMatter:()=>o,metadata:()=>l,toc:()=>m});var r=a(87462),n=(a(67294),a(3905));const o={id:"NavSourceFormatter",title:"Class: NavSourceFormatter",sidebar_label:"NavSourceFormatter",sidebar_position:0,custom_edit_url:null},i=void 0,l={unversionedId:"g3xtouchcommon/classes/NavSourceFormatter",id:"g3xtouchcommon/classes/NavSourceFormatter",title:"Class: NavSourceFormatter",description:"Utility class for creating nav source name formatters.",source:"@site/docs/g3xtouchcommon/classes/NavSourceFormatter.md",sourceDirName:"g3xtouchcommon/classes",slug:"/g3xtouchcommon/classes/NavSourceFormatter",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/NavSourceFormatter",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"NavSourceFormatter",title:"Class: NavSourceFormatter",sidebar_label:"NavSourceFormatter",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MfdWaypointPage",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/MfdWaypointPage"},next:{title:"NearestAirportNavSource",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/NearestAirportNavSource"}},s={},m=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"create",id:"create",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns-2",level:5},{value:"Defined in",id:"defined-in",level:4},{value:"createForBearingPointerSetting",id:"createforbearingpointersetting",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Parameters",id:"parameters-3",level:5},{value:"Returns",id:"returns-4",level:5},{value:"Defined in",id:"defined-in-1",level:4},{value:"createForIndicator",id:"createforindicator",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Parameters",id:"parameters-5",level:5},{value:"Returns",id:"returns-6",level:5},{value:"Defined in",id:"defined-in-2",level:4},{value:"createForSource",id:"createforsource",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Parameters",id:"parameters-7",level:5},{value:"Returns",id:"returns-8",level:5},{value:"Defined in",id:"defined-in-3",level:4}],p={toc:m},d="wrapper";function c(e){let{components:t,...a}=e;return(0,n.kt)(d,(0,r.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"Utility class for creating nav source name formatters."),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new NavSourceFormatter"),"(): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/NavSourceFormatter"},(0,n.kt)("inlineCode",{parentName:"a"},"NavSourceFormatter"))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/NavSourceFormatter"},(0,n.kt)("inlineCode",{parentName:"a"},"NavSourceFormatter"))),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"create"},"create"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"create"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"showGpsIndex"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"showNavIndex"),"): (",(0,n.kt)("inlineCode",{parentName:"p"},"sourceName"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#g3xtouchnavsourcename"},(0,n.kt)("inlineCode",{parentName:"a"},"G3XTouchNavSourceName")),") => ",(0,n.kt)("inlineCode",{parentName:"p"},"string")),(0,n.kt)("p",null,"Creates a function which generates formatted nav source names."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"showGpsIndex")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether to show the index for GPS-type nav sources.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"showNavIndex")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether to show the index for NAV-type nav sources.")))),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"fn")),(0,n.kt)("p",null,"A function which generates formatted nav source names."),(0,n.kt)("p",null,"\u25b8 (",(0,n.kt)("inlineCode",{parentName:"p"},"sourceName"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"string")),(0,n.kt)("h5",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"sourceName")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#g3xtouchnavsourcename"},(0,n.kt)("inlineCode",{parentName:"a"},"G3XTouchNavSourceName")))))),(0,n.kt)("h5",{id:"returns-2"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"string")),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Graphics/Text/NavSourceFormatter.ts:18"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"createforbearingpointersetting"},"createForBearingPointerSetting"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"createForBearingPointerSetting"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"showGpsIndex"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"showNavIndex"),"): (",(0,n.kt)("inlineCode",{parentName:"p"},"bearingPointerSource"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/enums/PfdBearingPointerSource"},(0,n.kt)("inlineCode",{parentName:"a"},"PfdBearingPointerSource")),") => ",(0,n.kt)("inlineCode",{parentName:"p"},"string")),(0,n.kt)("p",null,"Creates a function which generates formatted nav source names for nav sources."),(0,n.kt)("h4",{id:"parameters-2"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"showGpsIndex")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether to show the index for GPS-type nav sources.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"showNavIndex")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether to show the index for NAV-type nav sources.")))),(0,n.kt)("h4",{id:"returns-3"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"fn")),(0,n.kt)("p",null,"A function which generates formatted nav source names for nav sources."),(0,n.kt)("p",null,"\u25b8 (",(0,n.kt)("inlineCode",{parentName:"p"},"bearingPointerSource"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"string")),(0,n.kt)("h5",{id:"parameters-3"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"bearingPointerSource")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/enums/PfdBearingPointerSource"},(0,n.kt)("inlineCode",{parentName:"a"},"PfdBearingPointerSource")))))),(0,n.kt)("h5",{id:"returns-4"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"string")),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Graphics/Text/NavSourceFormatter.ts:100"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"createforindicator"},"createForIndicator"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"createForIndicator"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"showGpsIndex"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"showNavIndex"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"showNavType"),"): (",(0,n.kt)("inlineCode",{parentName:"p"},"indicator"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#g3xtouchnavindicator"},(0,n.kt)("inlineCode",{parentName:"a"},"G3XTouchNavIndicator")),") => ",(0,n.kt)("inlineCode",{parentName:"p"},"string")),(0,n.kt)("p",null,"Creates a function which generates formatted nav source names for nav indicators."),(0,n.kt)("h4",{id:"parameters-4"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"showGpsIndex")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether to show the index for GPS-type nav sources.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"showNavIndex")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether to show the index for NAV-type nav sources.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"showNavType")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether to show the navaid type (VOR vs LOC) for NAV-type nav sources. If ",(0,n.kt)("inlineCode",{parentName:"td"},"false"),", ",(0,n.kt)("inlineCode",{parentName:"td"},"'VLOC'")," will be used as the name for all NAV-type sources.")))),(0,n.kt)("h4",{id:"returns-5"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"fn")),(0,n.kt)("p",null,"A function which generates formatted nav source names for nav indicators."),(0,n.kt)("p",null,"\u25b8 (",(0,n.kt)("inlineCode",{parentName:"p"},"indicator"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"string")),(0,n.kt)("h5",{id:"parameters-5"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"indicator")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#g3xtouchnavindicator"},(0,n.kt)("inlineCode",{parentName:"a"},"G3XTouchNavIndicator")))))),(0,n.kt)("h5",{id:"returns-6"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"string")),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Graphics/Text/NavSourceFormatter.ts:60"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"createforsource"},"createForSource"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"createForSource"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"showGpsIndex"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"showNavIndex"),"): (",(0,n.kt)("inlineCode",{parentName:"p"},"source"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"NavReferenceSource"),"<",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#g3xtouchnavsourcename"},(0,n.kt)("inlineCode",{parentName:"a"},"G3XTouchNavSourceName")),">",") => ",(0,n.kt)("inlineCode",{parentName:"p"},"string")),(0,n.kt)("p",null,"Creates a function which generates formatted nav source names for nav sources."),(0,n.kt)("h4",{id:"parameters-6"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"showGpsIndex")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether to show the index for GPS-type nav sources.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"showNavIndex")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether to show the index for NAV-type nav sources.")))),(0,n.kt)("h4",{id:"returns-7"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"fn")),(0,n.kt)("p",null,"A function which generates formatted nav source names for nav sources."),(0,n.kt)("p",null,"\u25b8 (",(0,n.kt)("inlineCode",{parentName:"p"},"source"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"string")),(0,n.kt)("h5",{id:"parameters-7"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"source")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"NavReferenceSource"),"<",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#g3xtouchnavsourcename"},(0,n.kt)("inlineCode",{parentName:"a"},"G3XTouchNavSourceName")),">")))),(0,n.kt)("h5",{id:"returns-8"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"string")),(0,n.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,n.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Graphics/Text/NavSourceFormatter.ts:41"))}c.isMDXComponent=!0}}]);