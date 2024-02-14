"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[30381],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>k});var l=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);t&&(l=l.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,l)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,l,r=function(e,t){if(null==e)return{};var n,l,r={},i=Object.keys(e);for(l=0;l<i.length;l++)n=i[l],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(l=0;l<i.length;l++)n=i[l],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=l.createContext({}),o=function(e){var t=l.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},p=function(e){var t=o(e.components);return l.createElement(s.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return l.createElement(l.Fragment,{},t)}},h=l.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,s=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),u=o(n),h=r,k=u["".concat(s,".").concat(h)]||u[h]||m[h]||i;return n?l.createElement(k,a(a({ref:t},p),{},{components:n})):l.createElement(k,a({ref:t},p))}));function k(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,a=new Array(i);a[0]=h;var d={};for(var s in t)hasOwnProperty.call(t,s)&&(d[s]=t[s]);d.originalType=e,d[u]="string"==typeof e?e:r,a[1]=d;for(var o=2;o<i;o++)a[o]=n[o];return l.createElement.apply(null,a)}return l.createElement.apply(null,n)}h.displayName="MDXCreateElement"},59972:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>a,default:()=>m,frontMatter:()=>i,metadata:()=>d,toc:()=>o});var l=n(87462),r=(n(67294),n(3905));const i={id:"FlightPathRenderStyle",title:"Class: FlightPathRenderStyle",sidebar_label:"FlightPathRenderStyle",sidebar_position:0,custom_edit_url:null},a=void 0,d={unversionedId:"framework/classes/FlightPathRenderStyle",id:"framework/classes/FlightPathRenderStyle",title:"Class: FlightPathRenderStyle",description:"A vector line rendering style to apply to a flight path display on the map.",source:"@site/docs/framework/classes/FlightPathRenderStyle.md",sourceDirName:"framework/classes",slug:"/framework/classes/FlightPathRenderStyle",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPathRenderStyle",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FlightPathRenderStyle",title:"Class: FlightPathRenderStyle",sidebar_label:"FlightPathRenderStyle",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPathLegPatternRenderer",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPathLegPatternRenderer"},next:{title:"FlightPathTurnCalculator",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPathTurnCalculator"}},s={},o=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"dash",id:"dash",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"isDisplayed",id:"isdisplayed",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"lineCap",id:"linecap",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"outlineStyle",id:"outlinestyle",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"outlineWidth",id:"outlinewidth",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"partsToRender",id:"partstorender",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"style",id:"style",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"width",id:"width",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"Default",id:"default",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"Hidden",id:"hidden",level:3},{value:"Defined in",id:"defined-in-10",level:4}],p={toc:o},u="wrapper";function m(e){let{components:t,...n}=e;return(0,r.kt)(u,(0,l.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A vector line rendering style to apply to a flight path display on the map."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new FlightPathRenderStyle"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"isDisplayed?"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/FlightPathRenderStyle"},(0,r.kt)("inlineCode",{parentName:"a"},"FlightPathRenderStyle"))),(0,r.kt)("p",null,"Creates an instance of a FlightPathRenderStyle."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"isDisplayed")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"true")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether or not the path is displayed.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/FlightPathRenderStyle"},(0,r.kt)("inlineCode",{parentName:"a"},"FlightPathRenderStyle"))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/mapsystem/MapSystemPlanRenderer.ts:121"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"dash"},"dash"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"dash"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number"),"[]"),(0,r.kt)("p",null,"A dash-array configuration for the line, if any."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/mapsystem/MapSystemPlanRenderer.ts:130"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isdisplayed"},"isDisplayed"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"isDisplayed"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"true")),(0,r.kt)("p",null,"Whether or not the path is displayed."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/mapsystem/MapSystemPlanRenderer.ts:121"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"linecap"},"lineCap"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"lineCap"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"CanvasLineCap")),(0,r.kt)("p",null,"The line cap style to use. Defaults to ",(0,r.kt)("inlineCode",{parentName:"p"},"'butt'"),"."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/mapsystem/MapSystemPlanRenderer.ts:139"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"outlinestyle"},"outlineStyle"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"outlineStyle"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")),(0,r.kt)("p",null,"The style of the outline. Defaults to ",(0,r.kt)("inlineCode",{parentName:"p"},"'black'"),"."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/mapsystem/MapSystemPlanRenderer.ts:136"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"outlinewidth"},"outlineWidth"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"outlineWidth"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The width of the outline, in pixels. Defaults to 0 pixels."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/mapsystem/MapSystemPlanRenderer.ts:133"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"partstorender"},"partsToRender"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"partsToRender"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/FlightPathLegRenderPart"},(0,r.kt)("inlineCode",{parentName:"a"},"FlightPathLegRenderPart"))),(0,r.kt)("p",null,"An optional override of which parts to render for the leg."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/mapsystem/MapSystemPlanRenderer.ts:142"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"style"},"style"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"style"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"''")),(0,r.kt)("p",null,"The style string for the line."),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/mapsystem/MapSystemPlanRenderer.ts:127"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"width"},"width"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"width"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"2")),(0,r.kt)("p",null,"The pixel width of the path line."),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/mapsystem/MapSystemPlanRenderer.ts:124"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"default"},"Default"),(0,r.kt)("p",null,"\u25aa ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"Default"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/FlightPathRenderStyle"},(0,r.kt)("inlineCode",{parentName:"a"},"FlightPathRenderStyle"))),(0,r.kt)("p",null,"The default rendering style."),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/mapsystem/MapSystemPlanRenderer.ts:145"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"hidden"},"Hidden"),(0,r.kt)("p",null,"\u25aa ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"Hidden"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/FlightPathRenderStyle"},(0,r.kt)("inlineCode",{parentName:"a"},"FlightPathRenderStyle"))),(0,r.kt)("p",null,"A style that does not display the path."),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/mapsystem/MapSystemPlanRenderer.ts:148"))}m.isMDXComponent=!0}}]);