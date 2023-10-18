"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[33623],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>h});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var o=i.createContext({}),p=function(e){var t=i.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=p(e.components);return i.createElement(o.Provider,{value:t},e.children)},k="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},u=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,o=e.parentName,s=d(e,["components","mdxType","originalType","parentName"]),k=p(n),u=r,h=k["".concat(o,".").concat(u)]||k[u]||m[u]||a;return n?i.createElement(h,l(l({ref:t},s),{},{components:n})):i.createElement(h,l({ref:t},s))}));function h(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,l=new Array(a);l[0]=u;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[k]="string"==typeof e?e:r,l[1]=d;for(var p=2;p<a;p++)l[p]=n[p];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}u.displayName="MDXCreateElement"},57743:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>m,frontMatter:()=>a,metadata:()=>d,toc:()=>p});var i=n(87462),r=(n(67294),n(3905));const a={id:"PitchLadder",title:"Class: PitchLadder",sidebar_label:"PitchLadder",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"garminsdk/classes/PitchLadder",id:"garminsdk/classes/PitchLadder",title:"Class: PitchLadder",description:"A PFD attitude indicator. Displays a roll scale arc with pointer indicating the current roll angle, a pitch ladder",source:"@site/docs/garminsdk/classes/PitchLadder.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/PitchLadder",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/PitchLadder",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"PitchLadder",title:"Class: PitchLadder",sidebar_label:"PitchLadder",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"PfdTrafficAnnunciation",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/PfdTrafficAnnunciation"},next:{title:"ProcMapFlightPathPlanRenderer",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/ProcMapFlightPathPlanRenderer"}},o={},p=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"clipBounds",id:"clipbounds",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"clipBoundsSub",id:"clipboundssub",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"context",id:"context",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"contextType",id:"contexttype",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"needRebuildLadder",id:"needrebuildladder",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"needReposition",id:"needreposition",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"needUpdateClip",id:"needupdateclip",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"pitchResolution",id:"pitchresolution",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"props",id:"props",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"rootStyle",id:"rootstyle",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"showSub",id:"showsub",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"svgRef",id:"svgref",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"transform",id:"transform",level:3},{value:"Defined in",id:"defined-in-13",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"getContext",id:"getcontext",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"isAttached",id:"isattached",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"isVisible",id:"isvisible",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"onAfterRender",id:"onafterrender",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"onAttached",id:"onattached",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"onBeforeRender",id:"onbeforerender",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"onDetached",id:"ondetached",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-21",level:4},{value:"onProjectionChanged",id:"onprojectionchanged",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-22",level:4},{value:"onSleep",id:"onsleep",level:3},{value:"Returns",id:"returns-9",level:4},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-23",level:4},{value:"onUpdated",id:"onupdated",level:3},{value:"Returns",id:"returns-10",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"Defined in",id:"defined-in-24",level:4},{value:"onVisibilityChanged",id:"onvisibilitychanged",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-11",level:4},{value:"Overrides",id:"overrides-5",level:4},{value:"Defined in",id:"defined-in-25",level:4},{value:"onWake",id:"onwake",level:3},{value:"Returns",id:"returns-12",level:4},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-26",level:4},{value:"rebuildLadder",id:"rebuildladder",level:3},{value:"Returns",id:"returns-13",level:4},{value:"Defined in",id:"defined-in-27",level:4},{value:"render",id:"render",level:3},{value:"Returns",id:"returns-14",level:4},{value:"Overrides",id:"overrides-6",level:4},{value:"Defined in",id:"defined-in-28",level:4},{value:"renderChevron",id:"renderchevron",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-15",level:4},{value:"Defined in",id:"defined-in-29",level:4},{value:"repositionLadder",id:"repositionladder",level:3},{value:"Returns",id:"returns-16",level:4},{value:"Defined in",id:"defined-in-30",level:4},{value:"setVisible",id:"setvisible",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-17",level:4},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-31",level:4},{value:"updateClip",id:"updateclip",level:3},{value:"Returns",id:"returns-18",level:4},{value:"Defined in",id:"defined-in-32",level:4}],s={toc:p},k="wrapper";function m(e){let{components:t,...n}=e;return(0,r.kt)(k,(0,i.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A PFD attitude indicator. Displays a roll scale arc with pointer indicating the current roll angle, a pitch ladder\nindicating the current pitch angle, and a slip/skid indicator."),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"HorizonLayer"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/PitchLadderProps"},(0,r.kt)("inlineCode",{parentName:"a"},"PitchLadderProps")),">"),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"PitchLadder"))))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new PitchLadder"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"props"),")"),(0,r.kt)("p",null,"Creates an instance of a DisplayComponent."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"props")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/PitchLadderProps"},(0,r.kt)("inlineCode",{parentName:"a"},"PitchLadderProps"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The propertis of the component.")))),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,"HorizonLayer<PitchLadderProps",">",".constructor"),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:73"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"clipbounds"},"clipBounds"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"clipBounds"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Omit"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Float64Array"),", ",(0,r.kt)("inlineCode",{parentName:"p"},'"set"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},'"copyWithin"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},'"sort"'),">",">",">"),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:110"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"clipboundssub"},"clipBoundsSub"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"clipBoundsSub"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:119"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"context"},"context"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"context"),": [] = ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")),(0,r.kt)("p",null,"The context on this component, if any."),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,"HorizonLayer.context"),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:64"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"contexttype"},"contextType"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"contextType"),": readonly [] = ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")),(0,r.kt)("p",null,"The type of context for this component, if any."),(0,r.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,r.kt)("p",null,"HorizonLayer.contextType"),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:67"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"needrebuildladder"},"needRebuildLadder"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"needRebuildLadder"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"false")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:115"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"needreposition"},"needReposition"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"needReposition"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"false")),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:116"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"needupdateclip"},"needUpdateClip"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"needUpdateClip"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"false")),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:114"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"pitchresolution"},"pitchResolution"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"pitchResolution"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"0")),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:112"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"props"},"props"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"props"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/PitchLadderProps"},(0,r.kt)("inlineCode",{parentName:"a"},"PitchLadderProps"))," & ",(0,r.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,r.kt)("p",null,"The properties of the component."),(0,r.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,r.kt)("p",null,"HorizonLayer.props"),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:61"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"rootstyle"},"rootStyle"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"rootStyle"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"ObjectSubject"),"<{ ",(0,r.kt)("inlineCode",{parentName:"p"},"display"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," = ''; ",(0,r.kt)("inlineCode",{parentName:"p"},"height"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," = '0px'; ",(0,r.kt)("inlineCode",{parentName:"p"},"left"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," = '0px'; ",(0,r.kt)("inlineCode",{parentName:"p"},"overflow"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," = 'hidden'; ",(0,r.kt)("inlineCode",{parentName:"p"},"position"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," = 'absolute'; ",(0,r.kt)("inlineCode",{parentName:"p"},"top"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," = '0px'; ",(0,r.kt)("inlineCode",{parentName:"p"},"width"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," = '0px' }",">"),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:94"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"showsub"},"showSub"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"showSub"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,r.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:118"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"svgref"},"svgRef"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"svgRef"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"SVGElement"),">"),(0,r.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:92"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"transform"},"transform"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"transform"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"CssTransformSubject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"CssTransformChain"),"<","[",(0,r.kt)("inlineCode",{parentName:"p"},"CssTranslate3dTransform"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"CssRotateTransform"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"CssTranslateYTransform"),"]",">",">"),(0,r.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:104"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"destroy"},"destroy"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"overrides"},"Overrides"),(0,r.kt)("p",null,"HorizonLayer.destroy"),(0,r.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:343"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getcontext"},"getContext"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"getContext"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"context"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"never")),(0,r.kt)("p",null,"Gets a context data subscription from the context collection."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"An error if no data for the specified context type could be found."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"context")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"never")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The context to get the subscription for.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"never")),(0,r.kt)("p",null,"The requested context."),(0,r.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,r.kt)("p",null,"HorizonLayer.getContext"),(0,r.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:106"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isattached"},"isAttached"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"isAttached"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Checks whether this layer is attached to a horizon component."),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Whether this layer is attached to a horizon component."),(0,r.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,r.kt)("p",null,"HorizonLayer.isAttached"),(0,r.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,r.kt)("p",null,"sdk/components/horizon/HorizonLayer.ts:31"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isvisible"},"isVisible"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"isVisible"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Checks whether this layer is visible."),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"whether this layer is visible."),(0,r.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,r.kt)("p",null,"HorizonLayer.isVisible"),(0,r.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,r.kt)("p",null,"sdk/components/horizon/HorizonLayer.ts:39"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onafterrender"},"onAfterRender"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onAfterRender"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"node"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"A callback that is called after the component is rendered."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"node")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"VNode")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The component's VNode.")))),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,r.kt)("p",null,"HorizonLayer.onAfterRender"),(0,r.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:87"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onattached"},"onAttached"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onAttached"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"overrides-1"},"Overrides"),(0,r.kt)("p",null,"HorizonLayer.onAttached"),(0,r.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:127"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onbeforerender"},"onBeforeRender"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onBeforeRender"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"A callback that is called before the component is rendered."),(0,r.kt)("h4",{id:"returns-6"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,r.kt)("p",null,"HorizonLayer.onBeforeRender"),(0,r.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:80"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ondetached"},"onDetached"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onDetached"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"returns-7"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"overrides-2"},"Overrides"),(0,r.kt)("p",null,"HorizonLayer.onDetached"),(0,r.kt)("h4",{id:"defined-in-21"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:315"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onprojectionchanged"},"onProjectionChanged"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onProjectionChanged"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"projection"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"changeFlags"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"projection")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"HorizonProjection"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"changeFlags")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number"))))),(0,r.kt)("h4",{id:"returns-8"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"overrides-3"},"Overrides"),(0,r.kt)("p",null,"HorizonLayer.onProjectionChanged"),(0,r.kt)("h4",{id:"defined-in-22"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:141"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onsleep"},"onSleep"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onSleep"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"This method is called when this layer's parent horizon component is put to sleep."),(0,r.kt)("h4",{id:"returns-9"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-9"},"Inherited from"),(0,r.kt)("p",null,"HorizonLayer.onSleep"),(0,r.kt)("h4",{id:"defined-in-23"},"Defined in"),(0,r.kt)("p",null,"sdk/components/horizon/HorizonLayer.ts:88"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onupdated"},"onUpdated"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onUpdated"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"returns-10"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"overrides-4"},"Overrides"),(0,r.kt)("p",null,"HorizonLayer.onUpdated"),(0,r.kt)("h4",{id:"defined-in-24"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:152"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onvisibilitychanged"},"onVisibilityChanged"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"onVisibilityChanged"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"isVisible"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"parameters-4"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"isVisible")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean"))))),(0,r.kt)("h4",{id:"returns-11"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"overrides-5"},"Overrides"),(0,r.kt)("p",null,"HorizonLayer.onVisibilityChanged"),(0,r.kt)("h4",{id:"defined-in-25"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:122"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onwake"},"onWake"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onWake"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"This method is called when this layer's parent horizon component is awakened."),(0,r.kt)("h4",{id:"returns-12"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-10"},"Inherited from"),(0,r.kt)("p",null,"HorizonLayer.onWake"),(0,r.kt)("h4",{id:"defined-in-26"},"Defined in"),(0,r.kt)("p",null,"sdk/components/horizon/HorizonLayer.ts:81"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"rebuildladder"},"rebuildLadder"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"rebuildLadder"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Rebuilds this ladder."),(0,r.kt)("h4",{id:"returns-13"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-27"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:216"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"render"},"render"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"render"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"VNode")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"returns-14"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"VNode")),(0,r.kt)("h4",{id:"overrides-6"},"Overrides"),(0,r.kt)("p",null,"HorizonLayer.render"),(0,r.kt)("h4",{id:"defined-in-28"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:322"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"renderchevron"},"renderChevron"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"renderChevron"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"centerY"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"height"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"width"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"legWidth"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"direction"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"VNode")),(0,r.kt)("p",null,"Renders a warning chevron."),(0,r.kt)("h4",{id:"parameters-5"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"centerY")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The y coordinate of the center of the chevron, in pixels.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"height")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The height of the chevron, in pixels.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"width")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The width of the chevron, in pixels.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"legWidth")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The width of each leg of the chevron, in pixels.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"direction")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"1")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"-1")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The direction in which the chevron is pointed: ",(0,r.kt)("inlineCode",{parentName:"td"},"1")," for the positive y direction, ",(0,r.kt)("inlineCode",{parentName:"td"},"-1")," for the negative y direction.")))),(0,r.kt)("h4",{id:"returns-15"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"VNode")),(0,r.kt)("p",null,"A warning chevron, as a VNode."),(0,r.kt)("h4",{id:"defined-in-29"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:299"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"repositionladder"},"repositionLadder"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"repositionLadder"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Repositions this ladder based on the current pitch and bank."),(0,r.kt)("h4",{id:"returns-16"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-30"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:193"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"setvisible"},"setVisible"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"setVisible"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"val"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Sets this layer's visibility."),(0,r.kt)("h4",{id:"parameters-6"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"val")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether this layer should be visible.")))),(0,r.kt)("h4",{id:"returns-17"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-11"},"Inherited from"),(0,r.kt)("p",null,"HorizonLayer.setVisible"),(0,r.kt)("h4",{id:"defined-in-31"},"Defined in"),(0,r.kt)("p",null,"sdk/components/horizon/HorizonLayer.ts:47"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"updateclip"},"updateClip"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"updateClip"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Updates this ladder's clipping boundaries."),(0,r.kt)("h4",{id:"returns-18"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-32"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx:176"))}m.isMDXComponent=!0}}]);